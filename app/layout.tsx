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
            {children}
        </Providers>
      </body>
    </html>
  );
}
