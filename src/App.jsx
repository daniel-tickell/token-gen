import { useState } from 'react';
import Layout from './components/Layout';
import ListImporter from './components/ListImporter';
import TokenList from './components/TokenList';
import TokenPreview from './components/TokenPreview';
import { parseList } from './utils/parser';
import { getBaseSize } from './utils/baseSizes';

function App() {
  const [units, setUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState(null);

  const handleParse = (text) => {
    const parsed = parseList(text);
    const enriched = parsed.map(u => ({
      ...u,
      baseSize: getBaseSize(u.name) || '32mm', // Default to 32mm if unknown
    }));
    setUnits(enriched);
    if (enriched.length > 0) {
      setSelectedUnitId(enriched[0].id);
    }
  };

  const handleUpdateUnit = (id, newProps) => {
    setUnits(prev => prev.map(u =>
      u.id === id ? { ...u, ...newProps } : u
    ));
  };

  const selectedUnit = units.find(u => u.id === selectedUnitId);

  return (
    <Layout>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <ListImporter onParse={handleParse} />
          <TokenList
            units={units}
            selectedId={selectedUnitId}
            onSelect={setSelectedUnitId}
          />
        </div>
        <div>
          <TokenPreview unit={selectedUnit} onUpdate={handleUpdateUnit} />
        </div>
      </div>
    </Layout>
  );
}

export default App;
