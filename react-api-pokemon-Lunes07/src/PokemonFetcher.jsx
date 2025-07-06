import React, { useState, useEffect } from 'react';
import './PokemonFetcher.css';

const TOTAL_POKEMON = 898;

const PokemonFetcher = () => {
  const [aleatorios, setAleatorios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState(null);

  // Mostrar 4 Pokémon aleatorios al inicio
  useEffect(() => {
    const fetchAleatorios = async () => {
      const fetched = [];
      const ids = new Set();
      while (ids.size < 4) {
        ids.add(Math.floor(Math.random() * TOTAL_POKEMON) + 1);
      }
      for (const id of ids) {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
        const data = await res.json();
        fetched.push({
          id: data.id,
          nombre: data.name,
          imagen: data.sprites.front_default,
          tipos: data.types.map(t => t.type.name),
        });
      }
      setAleatorios(fetched);
    };
    fetchAleatorios();
  }, []);

  // 🔍 Búsqueda optimizada por nombre o tipo
  const buscarPokemon = async () => {
    if (!busqueda) {
      setResultados([]);
      return;
    }

    try {
      setCargandoBusqueda(true);
      setErrorBusqueda(null);

      const coincidencias = [];

      // 1. Buscar por nombre en la lista general
      const resLista = await fetch('https://pokeapi.co/api/v2/pokemon?limit=898');
      const dataLista = await resLista.json();
      const porNombre = dataLista.results.filter(p =>
        p.name.toLowerCase().includes(busqueda.toLowerCase())
      ).slice(0, 10); // máximo 10

      coincidencias.push(...porNombre);

      // 2. Si no hay coincidencias por nombre, buscar por tipo
      if (coincidencias.length === 0) {
        const resTipo = await fetch(`https://pokeapi.co/api/v2/type/${busqueda.toLowerCase()}`);
        if (!resTipo.ok) throw new Error('Tipo no encontrado');
        const dataTipo = await resTipo.json();
        const pokesTipo = dataTipo.pokemon.slice(0, 10);
        for (const p of pokesTipo) {
          coincidencias.push(p.pokemon);
        }
      }

      // 3. Obtener detalles completos solo de los seleccionados
      const detalles = [];
      for (const p of coincidencias) {
        const pokeRes = await fetch(p.url);
        const pokeData = await pokeRes.json();
        detalles.push({
          id: pokeData.id,
          nombre: pokeData.name,
          imagen: pokeData.sprites.front_default,
          tipos: pokeData.types.map(t => t.type.name),
        });
      }

      setResultados(detalles);
    } catch (error) {
      setErrorBusqueda('No se encontraron resultados válidos.');
    } finally {
      setCargandoBusqueda(false);
    }
  };

  return (
    <div className="pokemon-container">
      <h2>Tus 4 Pokémon Aleatorios</h2>
      <div className="pokemon-list">
        {aleatorios.map(pokemon => (
          <div key={pokemon.id} className="pokemon-card">
            <h3>{pokemon.nombre.charAt(0).toUpperCase() + pokemon.nombre.slice(1)}</h3>
            <img src={pokemon.imagen} alt={pokemon.nombre} />
            <p><strong>Tipos:</strong> {pokemon.tipos.join(', ')}</p>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: '40px' }}>Buscar Pokémon por nombre o tipo</h2>

      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <input
          type="text"
          placeholder="Ej: bulbasaur o water"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '16px',
            width: '300px'
          }}
        />
        <button
          onClick={buscarPokemon}
          style={{
            padding: '10px 16px',
            borderRadius: '6px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Buscar
        </button>
      </div>

      {cargandoBusqueda && <p style={{ color: '#fff' }}>Buscando...</p>}
      {errorBusqueda && <p className="error">{errorBusqueda}</p>}

      {resultados.length > 0 && (
        <div className="pokemon-list">
          {resultados.map(pokemon => (
            <div key={pokemon.id} className="pokemon-card">
              <h3>{pokemon.nombre.charAt(0).toUpperCase() + pokemon.nombre.slice(1)}</h3>
              <img src={pokemon.imagen} alt={pokemon.nombre} />
              <p><strong>Tipos:</strong> {pokemon.tipos.join(', ')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PokemonFetcher;
