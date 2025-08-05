import { useNavigate } from 'react-router-dom';
import '../styles/NotFoundPage.css';


export default function NotFoundPage() {

    const navigate = useNavigate();

    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <div className="not-found-illustration">
                    <img src="/src/assets/icons/error-404-icon.png" />
                </div>

                <h1 className="not-found-title">404 - Page Not Found</h1>
                <p className="not-found-message">
                The page you're looking for doesn't exist or has been moved.
                </p>

                <button 
                    className="not-found-button"
                    onClick={() => navigate(-1)}
                >
                    <span>&lt;</span>
                    <span>Back</span>
                </button>
            </div>
        </div>
    )
}