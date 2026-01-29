import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en" className="dark">
            <Head>
                <meta name="theme-color" content="#0b1221" />
            </Head>
            <body className="bg-background text-foreground antialiased selection:bg-primary/30 selection:text-white">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
