import Header from "../components/Header";
import Providers from "../providers/Providers";
import "../styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <Providers>
          <Header />
            {children}
        </Providers>
      </body>
    </html>
  );
}
