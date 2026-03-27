import { ReactNode } from 'react'
import Footer from '../footer/footer';
import "./layout.css";
import Nav from '../navbar/navbar';

function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Nav/>
      <div className='content'>
        {children}
      </div>
      <Footer/>
    </div>
  )
}

export default Layout
