#!/usr/bin/env python3
# Generates the app's sound effects by synthesis (no samples, no dependencies).
# Usage: python3 sounds/generate.py   (needs `lame` to encode the MP3 files)
#
# Every sound is built from a few primitives: soft mallets (marimba-like), bell partials,
# short pops, filtered noise and a small reverb. Style: minimal and modern, no 8-bit waves,
# no sirens, no slide whistles. Change the recipes below and run again.

import math
import os
import random
import struct
import subprocess
import tempfile
import wave

SR = 44100
OUT = os.path.dirname(os.path.abspath(__file__))

random.seed(7)  # same noise on every run


# ---------- primitives ----------

def silence(seconds):
    return [0.0] * int(seconds * SR)


def mix(target, signal, at=0.0, gain=1.0):
    # adds signal into target starting at `at` seconds, growing target if needed
    start = int(at * SR)
    end = start + len(signal)
    if end > len(target):
        target.extend([0.0] * (end - len(target)))
    for i, value in enumerate(signal):
        target[start + i] += value * gain
    return target


def envelope(n, attack, decay, hold=0.0):
    # linear attack, optional hold, exponential decay (decay = time to fall to ~1/e)
    a = max(1, int(attack * SR))
    h = int(hold * SR)
    out = []
    for i in range(n):
        if i < a:
            out.append(i / a)
        elif i < a + h:
            out.append(1.0)
        else:
            out.append(math.exp(-(i - a - h) / (decay * SR)))
    return out


def wave_value(shape, phase):
    if shape == 'sine':
        return math.sin(phase)
    if shape == 'triangle':
        return 2 / math.pi * math.asin(math.sin(phase))
    raise ValueError(shape)


def tone(freq, duration, shape='sine', attack=0.003, decay=0.1, hold=0.0,
         to_freq=None, glide=None, vibrato=0.0, vibrato_rate=6.0):
    # freq glides to to_freq over `glide` seconds (default: whole duration), exponentially
    n = int(duration * SR)
    env = envelope(n, attack, decay, hold)
    glide_n = int((glide if glide is not None else duration) * SR) or 1
    out = []
    phase = 0.0
    for i in range(n):
        f = freq
        if to_freq is not None:
            k = min(i / glide_n, 1.0)
            f = freq * (to_freq / freq) ** k
        if vibrato:
            f *= 1 + vibrato * math.sin(2 * math.pi * vibrato_rate * i / SR)
        phase += 2 * math.pi * f / SR
        out.append(wave_value(shape, phase) * env[i])
    return out


def bell(freq, duration, decay=0.4, attack=0.002, brightness=1.0):
    # sine partials with shorter decays for the upper ones: glassy chime
    partials = [(1.0, 1.0, 1.0), (2.0, 0.35 * brightness, 0.6), (3.01, 0.15 * brightness, 0.4),
                (4.2, 0.06 * brightness, 0.25)]
    out = silence(duration)
    for ratio, gain, decay_scale in partials:
        if freq * ratio > SR / 2.2:
            continue
        mix(out, tone(freq * ratio, duration, attack=attack, decay=decay * decay_scale), gain=gain)
    return out


def noise(duration, attack=0.002, decay=0.05, hold=0.0):
    n = int(duration * SR)
    env = envelope(n, attack, decay, hold)
    return [(random.random() * 2 - 1) * env[i] for i in range(n)]


def lowpass(signal, cutoff):
    # one pole; cutoff may be a function of the sample index (sweeps)
    out, y = [], 0.0
    for i, x in enumerate(signal):
        c = cutoff(i) if callable(cutoff) else cutoff
        a = 1 - math.exp(-2 * math.pi * c / SR)
        y += a * (x - y)
        out.append(y)
    return out


def highpass(signal, cutoff):
    low = lowpass(signal, cutoff)
    return [x - l for x, l in zip(signal, low)]


def bandpass(signal, center):
    # two passes around the center: rough but enough for whooshes
    if callable(center):
        return highpass(lowpass(signal, lambda i: center(i) * 1.4), lambda i: center(i) / 1.4)
    return highpass(lowpass(signal, center * 1.4), center / 1.4)


def reverb(signal, wet=0.18, tail=0.5):
    # small Schroeder reverb: 4 combs + 2 allpasses
    out = signal + [0.0] * int(tail * SR)
    combs = [(0.0297, 0.77), (0.0371, 0.75), (0.0411, 0.73), (0.0437, 0.71)]
    wet_sum = [0.0] * len(out)
    for delay, feedback in combs:
        d = int(delay * SR)
        buf = [0.0] * len(out)
        for i in range(len(out)):
            delayed = buf[i - d] if i >= d else 0.0
            buf[i] = out[i] + delayed * feedback
            wet_sum[i] += delayed
    for delay, g in [(0.005, 0.7), (0.0017, 0.7)]:
        d = int(delay * SR)
        x_hist = wet_sum[:]
        y = [0.0] * len(out)
        for i in range(len(out)):
            xd = x_hist[i - d] if i >= d else 0.0
            yd = y[i - d] if i >= d else 0.0
            y[i] = -g * x_hist[i] + xd + g * yd
        wet_sum = y
    return [dry + w * wet / 4 for dry, w in zip(out, wet_sum)]


def finish(signal, peak):
    # trims trailing silence, normalizes the peak and fades the edges (no pops)
    threshold = max(abs(x) for x in signal) * 0.001
    end = len(signal)
    while end > 1 and abs(signal[end - 1]) < threshold:
        end -= 1
    signal = signal[:end]
    top = max(abs(x) for x in signal) or 1.0
    signal = [x / top * peak for x in signal]
    fade_in, fade_out = int(0.001 * SR), int(0.008 * SR)
    for i in range(min(fade_in, len(signal))):
        signal[i] *= i / fade_in
    for i in range(min(fade_out, len(signal))):
        signal[-1 - i] *= i / fade_out
    return signal


def note(name):
    # 'C5' -> Hz (A4 = 440)
    names = {'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3,
             'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2}
    pitch, octave = name[:-1], int(name[-1])
    return 440 * 2 ** ((names[pitch] + (octave - 4) * 12) / 12)


def mallet(freq, duration=0.5, decay=0.18, muted=False, attack=0.0015):
    # marimba-like: round fundamental, a quick 4x overtone for the strike, a soft thump
    if muted:
        decay *= 0.45
    out = tone(freq, duration, attack=attack, decay=decay)
    if freq * 4 < SR / 2.2:
        mix(out, tone(freq * 4, duration, attack=attack, decay=decay * 0.12), gain=0.22 if not muted else 0.08)
    mix(out, lowpass(noise(0.012, attack=0.0005, decay=0.002), freq * 2), gain=0.15)
    return lowpass(out, 3500) if muted else out


def pop(freq, duration=0.06, drop=0.75):
    # tiny bubble: sine falling a bit in the first milliseconds
    return tone(freq, duration, attack=0.001, decay=duration / 3, to_freq=freq * drop, glide=0.012)


def chord(notes, at_step, build):
    # plays `notes` one after another, `at_step` seconds apart
    out = silence(0.05)
    for i, n in enumerate(notes):
        mix(out, build(note(n), i), at=i * at_step)
    return out


# ---------- recipes ----------
# peak levels: small UI sounds stay quieter than feedback and rewards

QUIET, MEDIUM, LOUD = 0.45, 0.6, 0.7

sounds = {}


def sound(path, peak=MEDIUM):
    def register(build):
        sounds[path] = (build, peak)
        return build
    return register


# click: buttons and links

@sound('click/click-1', QUIET)
def _():
    return mix(highpass(noise(0.03, decay=0.004), 2500), tone(2400, 0.04, decay=0.012), gain=0.6)


@sound('click/click-2', QUIET)
def _():
    return mallet(note('G6'), 0.08, decay=0.02, muted=True)


@sound('click/click-3', QUIET)
def _():
    return mix(tone(820, 0.06, decay=0.02), lowpass(noise(0.02, decay=0.004), 1800), gain=0.4)


# tap: touch on cards, nodes and list items (softer than click)

@sound('tap/tap-1', QUIET)
def _():
    return pop(680)


@sound('tap/tap-2', QUIET)
def _():
    return mallet(note('C5'), 0.12, decay=0.05, muted=True)


@sound('tap/tap-3', QUIET)
def _():
    return bell(1760, 0.2, decay=0.06, brightness=0.6)


# toggle: switches and segmented controls (on goes up, off goes down)

@sound('toggle/toggle-on-1', QUIET)
def _():
    return mallet(note('E6'), 0.1, decay=0.03, muted=True)


@sound('toggle/toggle-off-1', QUIET)
def _():
    return mallet(note('A5'), 0.1, decay=0.03, muted=True)


@sound('toggle/toggle-on-2', QUIET)
def _():
    return mix(pop(900, drop=0.85), highpass(noise(0.012, decay=0.002), 3500), gain=0.25)


@sound('toggle/toggle-off-2', QUIET)
def _():
    return mix(pop(620, drop=0.85), highpass(noise(0.012, decay=0.002), 3500), gain=0.25)


# success: saved, sent, correct

@sound('success/success-1')
def _():
    s = bell(note('G5'), 0.6, decay=0.25)
    return reverb(mix(s, bell(note('C6'), 0.6, decay=0.35), at=0.08), wet=0.15, tail=0.3)


@sound('success/success-2')
def _():
    s = chord(['C5', 'E5', 'G5'], 0.07, lambda f, i: bell(f, 0.7, decay=0.3 if i < 2 else 0.45))
    return reverb(s, wet=0.2, tail=0.4)


@sound('success/success-3')
def _():
    s = chord(['E5', 'A5'], 0.09, lambda f, i: mallet(f, 0.5, decay=0.12 if i == 0 else 0.22))
    return reverb(s, wet=0.12, tail=0.25)


# danger: wrong answer, errors, destructive actions (low and muted, never harsh)

@sound('danger/danger-1')
def _():
    return chord(['D4', 'A#3'], 0.11, lambda f, i: mallet(f, 0.4, decay=0.14, muted=True))


@sound('danger/danger-2')
def _():
    # single soft thud
    return mix(mallet(note('F3'), 0.3, decay=0.12, muted=True), lowpass(noise(0.05, decay=0.015), 400), gain=0.4)


@sound('danger/danger-3')
def _():
    # attention: the same note twice, like a gentle tap on the shoulder
    return chord(['G4', 'G4'], 0.12, lambda f, i: mallet(f, 0.3, decay=0.1))


@sound('danger/danger-4')
def _():
    # delete: a low note and a short swish that fades down
    sweep = lambda i: 1800 * (300 / 1800) ** min(i / (0.25 * SR), 1)
    s = [x * 2 for x in bandpass(noise(0.3, attack=0.02, decay=0.08), sweep)]
    return mix(s, mallet(note('C4'), 0.4, decay=0.15, muted=True), gain=1.0)


# zoom: trail zoom, images opening

@sound('zoom/zoom-in-1', QUIET)
def _():
    sweep = lambda i: 400 * (3000 / 400) ** min(i / (0.3 * SR), 1)
    return [x * 2.5 for x in bandpass(noise(0.35, attack=0.12, decay=0.08, hold=0.05), sweep)]


@sound('zoom/zoom-out-1', QUIET)
def _():
    sweep = lambda i: 3000 * (400 / 3000) ** min(i / (0.3 * SR), 1)
    return [x * 2.5 for x in bandpass(noise(0.35, attack=0.12, decay=0.08, hold=0.05), sweep)]


@sound('zoom/zoom-in-2', QUIET)
def _():
    sweep = lambda i: 900 * (4000 / 900) ** min(i / (0.12 * SR), 1)
    s = [x * 2 for x in bandpass(noise(0.15, attack=0.05, decay=0.04), sweep)]
    return mix(s, pop(1100, drop=0.9), at=0.1, gain=0.5)


@sound('zoom/zoom-out-2', QUIET)
def _():
    sweep = lambda i: 4000 * (900 / 4000) ** min(i / (0.12 * SR), 1)
    s = [x * 2 for x in bandpass(noise(0.15, attack=0.05, decay=0.04), sweep)]
    return mix(s, pop(700, drop=0.9), at=0.1, gain=0.5)


# ui: other interface moments

@sound('ui/notification')
def _():
    s = bell(note('A5'), 0.8, decay=0.3, brightness=0.7)
    return reverb(mix(s, bell(note('D6'), 0.8, decay=0.4, brightness=0.7), at=0.13), wet=0.2, tail=0.4)


@sound('ui/modal-open', QUIET)
def _():
    sweep = lambda i: 600 * (2200 / 600) ** min(i / (0.15 * SR), 1)
    return [x * 2 for x in bandpass(noise(0.18, attack=0.06, decay=0.05), sweep)]


@sound('ui/modal-close', QUIET)
def _():
    sweep = lambda i: 2200 * (600 / 2200) ** min(i / (0.15 * SR), 1)
    return [x * 2 for x in bandpass(noise(0.18, attack=0.06, decay=0.05), sweep)]


@sound('ui/send')
def _():
    sweep = lambda i: 500 * (5000 / 500) ** min(i / (0.22 * SR), 1)
    s = [x * 2.5 for x in bandpass(noise(0.25, attack=0.08, decay=0.06), sweep)]
    return mix(s, mallet(note('E6'), 0.3, decay=0.1), at=0.17, gain=0.5)


@sound('ui/delete')
def _():
    sweep = lambda i: 1500 * (400 / 1500) ** min(i / (0.18 * SR), 1)
    return [x * 2 for x in bandpass(noise(0.22, attack=0.01, decay=0.06), sweep)]


@sound('ui/key-1', QUIET)
def _():
    return mix(highpass(noise(0.025, decay=0.003), 1800), tone(1600, 0.03, decay=0.006), gain=0.35)


@sound('ui/key-2', QUIET)
def _():
    return mix(highpass(noise(0.025, decay=0.003), 1500), tone(1350, 0.03, decay=0.006), gain=0.35)


@sound('ui/key-3', QUIET)
def _():
    return mix(highpass(noise(0.025, decay=0.003), 2100), tone(1850, 0.03, decay=0.006), gain=0.35)


# game: trail rewards and feedback

@sound('game/correct')
def _():
    # bright and short, a fourth up: the "acertou" moment
    s = chord(['C6', 'F6'], 0.075, lambda f, i: mix(mallet(f, 0.5, decay=0.15 if i == 0 else 0.28),
                                                 bell(f * 2, 0.4, decay=0.12, brightness=0.3), gain=0.25))
    return reverb(s, wet=0.12, tail=0.25)


@sound('game/wrong')
def _():
    # low, short and muted: tells without scolding
    return chord(['E4', 'C4'], 0.1, lambda f, i: mallet(f, 0.35, decay=0.16, muted=True))


@sound('game/xp')
def _():
    s = chord(['A5', 'C#6', 'E6'], 0.05, lambda f, i: mallet(f, 0.35, decay=0.08 if i < 2 else 0.18))
    return reverb(s, wet=0.15, tail=0.3)


@sound('game/streak')
def _():
    swell = [x * 1.2 for x in lowpass(noise(0.45, attack=0.25, decay=0.08), lambda i: 300 + i * 0.1)]
    s = mix(swell, chord(['G5', 'D6'], 0.08, lambda f, i: bell(f, 0.6, decay=0.25 if i == 0 else 0.4)),
            at=0.22, gain=0.7)
    return reverb(s, wet=0.18, tail=0.4)


@sound('game/unlock')
def _():
    s = mix(highpass(noise(0.015, decay=0.003), 3000), pop(1400, drop=0.9), gain=0.4)
    mix(s, chord(['D5', 'A5'], 0.08, lambda f, i: mallet(f, 0.45, decay=0.12 if i == 0 else 0.25)), at=0.06)
    return reverb(s, wet=0.15, tail=0.3)


@sound('game/life-lost')
def _():
    s = chord(['A4', 'F4'], 0.13, lambda f, i: mallet(f, 0.45, decay=0.18, muted=True))
    return mix(s, lowpass(noise(0.06, decay=0.02), 500), gain=0.3)


@sound('game/checkin')
def _():
    s = mallet(note('E6'), 0.1, decay=0.025, muted=True)
    mix(s, chord(['C6', 'G6'], 0.09, lambda f, i: bell(f, 0.6, decay=0.18 if i == 0 else 0.3)), at=0.1, gain=0.8)
    return reverb(s, wet=0.15, tail=0.3)


@sound('game/badge', LOUD)
def _():
    # soft chord that blooms, with three ordered shimmers on top
    s = silence(0.1)
    for n in ['C5', 'E5', 'G5']:
        mix(s, tone(note(n), 1.3, attack=0.06, decay=0.45, hold=0.1), gain=0.3)
    mix(s, chord(['G6', 'C7', 'E7'], 0.09, lambda f, i: bell(f, 0.5, decay=0.15, brightness=0.4)), at=0.08, gain=0.35)
    return reverb(s, wet=0.25, tail=0.6)


@sound('game/level-up', LOUD)
def _():
    # trail complete: mallet arpeggio landing on a warm, clean chord
    s = chord(['C5', 'E5', 'G5', 'C6'], 0.085, lambda f, i: mallet(f, 0.6, decay=0.12 if i < 3 else 0.35))
    for n in ['C4', 'G4', 'E5']:
        mix(s, tone(note(n), 1.2, attack=0.08, decay=0.4, hold=0.15), at=0.26, gain=0.22)
    mix(s, bell(note('C7'), 0.8, decay=0.3, brightness=0.3), at=0.26, gain=0.15)
    return reverb(s, wet=0.22, tail=0.6)


# ---------- output ----------

def write_mp3(path, samples):
    with tempfile.TemporaryDirectory() as tmp:
        wav_path = os.path.join(tmp, 'sound.wav')
        with wave.open(wav_path, 'wb') as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(SR)
            wav.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, x)) * 32767)) for x in samples))
        # mono 96 kbps: transparent for short effects; lame writes the gapless header
        subprocess.run(['lame', '--quiet', '-m', 'm', '-b', '96', wav_path, path], check=True)


if __name__ == '__main__':
    for name, (build, peak) in sounds.items():
        path = os.path.join(OUT, f'{name}.mp3')
        os.makedirs(os.path.dirname(path), exist_ok=True)
        samples = finish(build(), peak)
        write_mp3(path, samples)
        print(f'{name}.mp3  {len(samples) / SR:.2f}s')
