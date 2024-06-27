import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Contact from './pages/Contact'
import SAC from './pages/SAC'
import About from './pages/About'
import Header from './components/Header/Header'

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                {/* Header */}
                <Header />
                <Routes>
                    <Route path="/" element={<Home />}/>
                    <Route path="/login" element={<Login />}/>
                    <Route path='/about' element={<About />}/>
                    <Route path='/sac' element={<SAC />}/>
                    <Route path='/register' element={<Register />}/>
                    <Route path='/contact' element={<Contact />}/>
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
