"use client"
import { useState } from "react";

export default function page() {
    const [color, setColor] = useState("white");
    const changeColor = (newColor: string) => {
        setColor(newColor);
    };

    return (
        <div style={{ height: "100vh", background: color, textAlign: "center" }}>
            <h1>Cambiar Color Page</h1>
            <p>Current color: {color}</p>
            <button onClick={() => changeColor("Lightblue")}>Azul</button>
            <button onClick={() => changeColor("Lightgreen")}>Verde</button>
            <button onClick={() => changeColor("Lightpink")}>Rosa</button>
            <div style={{ width: "100px", height: "100px", backgroundColor: color }}></div>
        </div>
    );
}

//Hooks

//useState Manejar el estado de un componente
//UseEfect=()=>{codigo,[color]} -Manejar eventos secundarios 
             //componetDiMount()
             //componentDidUpdate
             //ComponentDidUnmount
//UseRef -Crea referencia mutable, para acceder a elementos del DOM
//UseContext Manejar etsados globales -Redux
//
// Props (Propiedades o datos que pasamos de un componente a otro)
///Psre - Hijo - Nieto -Bisnieto