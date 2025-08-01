import React, { useState } from "react";
import { crearServicio, ServicioNuevo } from "../servicios/serviciosService";
import styles from "../styles/formularioServicio.module.css";

interface Props {
  token?: string;
  onServicioCreado?: () => void;
}

const FormularioServicio: React.FC<Props> = ({ token, onServicioCreado }) => {
  const [form, setForm] = useState<ServicioNuevo>({
    nombre: "",
    descripcion: "",
    duracion: "",
    precio: 0,
    imagen: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === "precio" ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await crearServicio(form, token);
      setSuccess("Servicio creado correctamente");
      setForm({ nombre: "", descripcion: "", duracion: "", precio: 0, imagen: "" });
      if (onServicioCreado) onServicioCreado();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formularioServicio}>
      <h2>Agregar nuevo servicio</h2>
      <label>Nombre
        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required />
      </label>
      <label>Descripción
        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" required />
      </label>
      <label>Duración (minutos)
        <input name="duracion" value={form.duracion} onChange={handleChange} placeholder="Duración (minutos)" required />
      </label>
      <label>Precio
        <input name="precio" type="number" value={form.precio} onChange={handleChange} placeholder="Precio" required min={0} />
      </label>
      <label>Imagen
        <input
          id="imagen-input"
          name="imagen"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                setForm(prev => ({ ...prev, imagen: reader.result as string }));
              };
              reader.readAsDataURL(file);
            }
          }}
        />
        <button
          type="button"
          onClick={() => document.getElementById('imagen-input')?.click()}
          className={styles["formularioServicio"] + " "}
        >
          Seleccionar imagen
        </button>
        {form.imagen && (
          <div>
            <img src={form.imagen} alt="preview" className={styles.imagenPreview} />
            <span style={{ fontSize: 12, color: '#555' }}>Imagen seleccionada</span>
          </div>
        )}
      </label>
      <button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar servicio"}
      </button>
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
    </form>
  );
};

export default FormularioServicio;
