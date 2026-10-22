'use client';

import { useMemo, useState, type ReactNode } from 'react';

import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from 'lucide-react';

import { Input } from '#/components/Input/Input';

import styles from './DataList.module.scss';

type SortValue = string | number | boolean;
type Direction = 'asc' | 'desc';

export interface Column<T> {
    key: string;
    label: string;
    // relative column width (e.g. '60%'); '1%' makes the column only as wide as its content
    width?: string;
    // takes the space left by the other columns and lets its content be cut ('...') instead of widening the table
    shrink?: boolean;
    // less horizontal padding, for columns with short content
    compact?: boolean;
    render: (row: T) => ReactNode;
    // without sortValue the column doesn't sort (e.g. Ações)
    sortValue?: (row: T) => SortValue;
}

interface DataListProps<T> {
    rows: T[];
    columns: Column<T>[];
    getKey: (row: T) => string;
    defaultSort?: { key: string; direction: Direction };
    emptyMessage: string;
    label: string;
    // all text of a row that the search should match (e.g. name, trail, mentor)
    searchText: (row: T) => string;
}

const cellClass = (column: Column<never>) =>
    [column.shrink && styles.shrink, column.compact && styles.compact].filter(Boolean).join(' ') || undefined;

// ignores case and accents
const normalize = (text: string) =>
    text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

// ascending: text A-Z, lower number first, boolean true first
function compare(a: SortValue, b: SortValue) {
    if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
    }
    if (typeof a === 'boolean' && typeof b === 'boolean') return Number(b) - Number(a);
    return Number(a) - Number(b);
}

export default function DataList<T>({
    rows,
    columns,
    getKey,
    defaultSort,
    emptyMessage,
    label,
    searchText,
}: DataListProps<T>) {
    const [sort, setSort] = useState(defaultSort ?? null);
    const [query, setQuery] = useState('');

    const sorted = useMemo(() => {
        const term = normalize(query.trim());
        const filtered = term
            ? rows.filter((row) => normalize(searchText(row)).includes(term))
            : rows;

        const column = columns.find((col) => col.key === sort?.key);
        if (!sort || !column?.sortValue) return filtered;

        // ties follow the first sortable column, always A-Z
        const tiebreak = columns.find((col) => col.sortValue)!.sortValue!;
        const primary  = column.sortValue;
        const sign     = sort.direction === 'asc' ? 1 : -1;

        return [...filtered].sort((a, b) =>
            sign * compare(primary(a), primary(b)) || compare(tiebreak(a), tiebreak(b)),
        );
    }, [rows, columns, sort, query, searchText]);

    function handleSort(key: string) {
        setSort((current) => ({
            key,
            direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
        }));
    }

    if (rows.length === 0) return <p className={styles.empty}>{emptyMessage}</p>;

    return (
        <div className={styles.wrapper}>
            <Input
                type='search'
                icon={Search}
                placeholder='Pesquisar'
                aria-label={`Pesquisar em ${label.toLowerCase()}`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
            />

            <div className={styles.container}>
            <table aria-label={label}>
                <thead>
                    <tr>
                        {columns.map((column) => {
                            const active = sort?.key === column.key;
                            const Icon = !active ? ChevronsUpDown
                                : sort.direction === 'asc' ? ChevronUp : ChevronDown;

                            return (
                                <th
                                    key={column.key}
                                    scope='col'
                                    className={cellClass(column)}
                                    style={{ width: column.width }}
                                    aria-sort={!column.sortValue ? undefined : !active ? 'none'
                                        : sort.direction === 'asc' ? 'ascending' : 'descending'}
                                >
                                    {column.sortValue ? (
                                        <button type='button' onClick={() => handleSort(column.key)}>
                                            {column.label}
                                            <Icon aria-hidden='true'/>
                                        </button>
                                    ) : column.label}
                                </th>
                            );
                        })}
                    </tr>
                </thead>

                <tbody>
                    {sorted.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className={styles.noResults}>
                                Nenhum resultado para &ldquo;{query.trim()}&rdquo;.
                            </td>
                        </tr>
                    )}

                    {sorted.map((row) => (
                        <tr key={getKey(row)}>
                            {columns.map((column) => (
                                <td key={column.key} className={cellClass(column)}>{column.render(row)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
}
