import { Save } from 'lucide-react';

import { SubmitButton } from './SubmitButton';

interface SaveButtonProps {
    loading?: boolean;
}

export function SaveButton({ loading }: SaveButtonProps) {
    return (
        <SubmitButton
            icon={Save}
            loading={loading}
            loadingLabel='Salvando...'
        >
            Salvar
        </SubmitButton>
    );
}