import React from "react";
import CitasForm from "@/components/CitasForm";
import Navbar from "../components/Navbar";

export default function CitasPage() {
  const [usuario, setUsuario] = React.useState(null);

  React.useEffect(() => {
    const usuarioLocal = localStorage.getItem("usuario");
    if (usuarioLocal) setUsuario(JSON.parse(usuarioLocal));
  }, []);

  return (
    <>
      <Navbar usuario={usuario} />
      <CitasForm />
    </>
  );
}