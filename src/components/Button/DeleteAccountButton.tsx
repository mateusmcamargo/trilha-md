import { Trash2 } from 'lucide-react';

import { Button } from './Button';

export function DeleteAccountButton() {
    return (
        <Button
            icon={Trash2}
            variant='danger'
            fullWidth
            href='/settings/delete-account'
        >
            Deletar conta
        </Button>
    );
}
