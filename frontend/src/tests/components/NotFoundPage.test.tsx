import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from '../../components/NotFoundPage';


describe('NotFoundPage', () => {
    it('dispaly 404 text and a back button', () => {
        render(
            <MemoryRouter>
                <NotFoundPage/>
            </MemoryRouter>
        )

        expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
        expect(screen.getByText(/doesn't exist or has been moved/i)).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /back/i })).toBeInTheDocument();
    });
});

