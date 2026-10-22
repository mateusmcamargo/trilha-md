import type { Json } from '#/types/database';

// "complete o código": code with blanks marked [[0]], [[1]]... and blocks to fill them
export interface CompleteCodeContent {
    instruction: string;
    code: string;
    options: { id: string; text: string }[];
}

// option id placed in each blank (null = empty)
export interface CompleteCodeAnswer {
    blanks: (string | null)[];
}

export type ItemType = 'complete_codigo';

export interface ActivityItem {
    id: string;
    type: ItemType;
    content: CompleteCodeContent;
}

// answer key, only known after checking (or in demo mode / mentor preview)
export interface ItemSolution {
    solution: CompleteCodeAnswer;
    explanation: string | null;
}

export const BLANK_PATTERN = /\[\[(\d+)\]\]/g;

export function blankCount(code: string) {
    const indexes = [...code.matchAll(BLANK_PATTERN)].map((match) => Number(match[1]));
    return indexes.length ? Math.max(...indexes) + 1 : 0;
}

export const itemTypes: Record<ItemType, { label: string }> = {
    complete_codigo: { label: 'Complete o código' },
};

export function emptyAnswer(item: ActivityItem): CompleteCodeAnswer {
    return { blanks: Array(blankCount(item.content.code)).fill(null) };
}

export function isAnswerComplete(answer: CompleteCodeAnswer) {
    return answer.blanks.length > 0 && answer.blanks.every((blank) => blank !== null);
}

// same rule as check_answer in the database: equal json
export function isAnswerCorrect(answer: CompleteCodeAnswer, solution: CompleteCodeAnswer) {
    return JSON.stringify(answer.blanks) === JSON.stringify(solution.blanks);
}

// text of the right answer, for the feedback after a mistake
export function describeSolution(item: ActivityItem, solution: CompleteCodeAnswer) {
    return solution.blanks
        .map((id) => item.content.options.find((option) => option.id === id)?.text ?? '?')
        .join('  ·  ');
}

// content comes from the database as json: only well formed items reach the player
export function parseItem(row: { id: string; type: string; content: Json }): ActivityItem | null {
    const content = row.content as Partial<CompleteCodeContent> | null;

    if (row.type !== 'complete_codigo' || !content
        || typeof content.code !== 'string'
        || !Array.isArray(content.options)) {
        return null;
    }

    return {
        id: row.id,
        type: 'complete_codigo',
        content: {
            instruction: typeof content.instruction === 'string' ? content.instruction : 'Complete o código:',
            code: content.code,
            options: content.options.filter((option) =>
                typeof option?.id === 'string' && typeof option?.text === 'string'),
        },
    };
}
