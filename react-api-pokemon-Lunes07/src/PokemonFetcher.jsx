
import React, { useState, useEffect } from 'react';
import './PokemonFetcher.css';

const TOTAL_POKEMON = 898;

const PokemonFetcher = () => {
  const [aleatorios, setAleatorios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState(null);

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

  const buscarPokemon = async () => {
    if (!busqueda) {
      setResultados([]);
      return;
    }

    try {
      setCargandoBusqueda(true);
      setErrorBusqueda(null);

      const coincidencias = [];

      const resLista = await fetch('https://pokeapi.co/api/v2/pokemon?limit=898');
      const dataLista = await resLista.json();
      const porNombre = dataLista.results.filter(p =>
        p.name.toLowerCase().includes(busqueda.toLowerCase())
      ).slice(0, 10);

      coincidencias.push(...porNombre);

      if (coincidencias.length === 0) {
        const resTipo = await fetch(`https://pokeapi.co/api/v2/type/${busqueda.toLowerCase()}`);
        if (!resTipo.ok) throw new Error('Tipo no encontrado');
        const dataTipo = await resTipo.json();
        const pokesTipo = dataTipo.pokemon.slice(0, 10);
        for (const p of pokesTipo) {
          coincidencias.push(p.pokemon);
        }
      }

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
            <div>
              {pokemon.tipos.map(tipo => (
                <span key={tipo} className={`pokemon-type type-${tipo.toLowerCase()}`}>
                  {tipo.toUpperCase()}
                </span>
              ))}
            </div>
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
        />
        <button onClick={buscarPokemon}>Buscar</button>
      </div>

      {cargandoBusqueda && <p style={{ color: '#555' }}>Buscando...</p>}
      {errorBusqueda && <p className="error">{errorBusqueda}</p>}

      {resultados.length > 0 && (
        <div className="pokemon-list">
          {resultados.map(pokemon => (
            <div key={pokemon.id} className="pokemon-card">
              <h3>{pokemon.nombre.charAt(0).toUpperCase() + pokemon.nombre.slice(1)}</h3>
              <img src={pokemon.imagen} alt={pokemon.nombre} />
              <div>
                {pokemon.tipos.map(tipo => (
                  <span key={tipo} className={`pokemon-type type-${tipo.toLowerCase()}`}>
                    {tipo.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PokemonFetcher;
