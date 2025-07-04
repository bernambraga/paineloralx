import React, { Suspense, useContext } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/Header/Header";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import PrivateRoute from "./PrivateRoute";
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner";

const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const SAC = React.lazy(() => import("./pages/SAC"));
const Bots = React.lazy(() => import("./pages/Bots"));
const Senhas = React.lazy(() => import("./pages/Senhas"));
const Dentistas = React.lazy(() => import("./pages/comercialDentistas"));
const Geral = React.lazy(() => import("./pages/comercialGeral"));
const Top15 = React.lazy(() => import("./pages/comercialTop15"));
const Admin = React.lazy(() => import("./pages/admin"));
const Modelos = React.lazy(() => import("./pages/Modelos"));
const Recepcao = React.lazy(() => import("./pages/Recepcao"));

const App = () => {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
};

const AppContent = () => {
  const [showNavBar, setShowNavBar] = React.useState(false);
  const location = useLocation();
  const { loading } = useContext(AuthContext);

  React.useEffect(() => {
    // Oculta a navbar e sidebar se estiver na rota de login
    if (location.pathname === "/") {
      setShowNavBar(false);
    } else {
      setShowNavBar(true);
    }
  }, [location]);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Header show={showNavBar} />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/comercial/geral" element={<Geral />} />
            <Route path="/comercial/top15" element={<Top15 />} />
            <Route path="/comercial/dentistas" element={<Dentistas />} />
            <Route path="/bots" element={<Bots />} />
            <Route path="/register" element={<Register />} />
            <Route path="/sac" element={<SAC />} />
            <Route path="/senhas" element={<Senhas />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/modelos" element={<Modelos />} />
            <Route path="/recepcao" element={<Recepcao />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
