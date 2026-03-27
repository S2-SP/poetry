
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AllBlog from './pages/allBlogs/allBlog';
import NoPage from './pages/noPage/noPage';
import { Toaster } from 'react-hot-toast';
import MyState from './context/data/myState';
import Welcome from './pages/welcome/welcome';
import PasswordGate from './components/passwordGate/PasswordGate';
import PoemDetail from './pages/poemDetail/poemDetail';
import { AdminAuthProvider } from './context/adminAuth/adminAuthContext';


export default function App() {
  return (
    <div>
      <AdminAuthProvider>
      <MyState>

      <Router>
        <Routes>
        <Route path='/' element={<Welcome/>} />
          <Route path='/allBlogs' element={<AllBlog/>} />
          <Route path='/*' element={<NoPage/>} />
          <Route path='/writer' element={<PasswordGate/>} />
          <Route path='/poem/:id' element={<PoemDetail/>} />
        </Routes>
        <Toaster/>
      </Router>
      </MyState>
      </AdminAuthProvider>
    </div>
  )
}
