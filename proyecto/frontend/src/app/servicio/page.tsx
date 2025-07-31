import React from 'react';
import ServicioList from './ServicioList';

const Page = () => {
    return (
        <div>
            <h1>Servicios Disponibles</h1>
            <ServicioList servicios={[]} />
        </div>
    );
};

export default Page;