import React, { useState } from 'react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbwC55WPsHzAoabUdvfLVc-K5_EhPyWWK9MDJYzox9JFSzI82t7rv6x1MwQ3ecTX0wGdlQ/exec", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });
  
      if (!response.ok) {
        throw new Error("No se pudo completar la solicitud");
      }
  
      const result = await response.json();
      if (result.success) {
        alert("Registro exitoso");
      } else {
        alert("Hubo un problema durante el registro");
      }
    } catch (error) {
      console.error("Error durante el registro:", error);
      alert("Hubo un problema al registrarse. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nombre de usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Registrando..." : "Registrar"}
      </button>
    </form>
  );
};

export default Register;
