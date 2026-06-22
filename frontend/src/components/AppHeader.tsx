import { Helmet } from "react-helmet-async";
import companyLogoTitle from '@/assets/icons/ROUANDI-logo-icon-title.ico';


export default function AppHeader(){
    return (
        <Helmet>
            <meta charSet="UTF-8" />
            <link rel="icon" href={companyLogoTitle}/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Rouandi maintenance</title>
        </Helmet>
    )
}