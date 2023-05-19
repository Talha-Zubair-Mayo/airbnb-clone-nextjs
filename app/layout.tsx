import RegisterModal from './Components/Modals/RegisterModal'
import Navbar from './Components/Navbar/Navbar'
import ToasterProvider from './Providers/ToasterProvider'
import './globals.css'
import { Nunito } from 'next/font/google'

const font = Nunito({ subsets: ['latin'] })

export const metadata = {
  title: 'Airbnb Clone - Your Ultimate Vacation Rental Platform',
  description: 'Experience the joy of travel with our Airbnb Clone, a meticulously crafted web application that lets you discover and book unique accommodations worldwide.',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={font.className}>
        <ToasterProvider />
        <Navbar />
        <RegisterModal />
        {children}
      </body>
    </html>
  );
}
