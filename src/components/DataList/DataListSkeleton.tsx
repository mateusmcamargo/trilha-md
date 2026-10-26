import Skeleton from '#/components/Skeleton/Skeleton';

import styles from './DataList.module.scss';

interface DataListSkeletonProps {
    // column headers are static, so they show for real
    columns: string[];
    rows?: number;
}

// same layout as DataList: search field and table
export default function DataListSkeleton({ columns, rows = 5 }: DataListSkeletonProps) {
    return (
        <div className={styles.wrapper} aria-hidden='true'>
            <Skeleton height='4.4rem' radius='1rem'/>

            <div className={styles.container}>
                <table>
                    <thead>
                        <tr>
                            {columns.map((column) => <th key={column} scope='col'>{column}</th>)}
                        </tr>
                    </thead>

                    <tbody>
                        {Array.from({ length: rows }, (_, row) => (
                            <tr key={row}>
                                {columns.map((column) => (
                                    <td key={column}><Skeleton width='80%'/></td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
