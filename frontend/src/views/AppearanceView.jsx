import React, { useState } from 'react';
import { useTheme, THEMES } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ThemeCard from '../components/common/ThemeCard';
import Button from '../components/common/Button';
import { RotateCcw } from 'lucide-react';

export default function AppearanceView() {
  const { theme, setTheme, resetTheme } = useTheme();
  const { updateUserTheme } = useAuth();
  const [selectedTheme, setSelectedTheme] = useState(theme);

  const handleSelectTheme = async (newTheme) => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
    await updateUserTheme(newTheme);
  };

  const handleReset = async () => {
    resetTheme();
    setSelectedTheme(THEMES.SKETCH);
    await updateUserTheme(THEMES.SKETCH);
  };

  const themeOptions = [
    {
      key: THEMES.SKETCH,
      title: 'Sketch (default)',
      description: 'Surface #FFF · Text #000 · Action #000',
      canvasBg: '#FFFFFF',
      cardBg: '#FFFFFF',
      cardBorder: '1.5px solid #000000',
      textColor: '#000000',
      actionColor: '#000000',
      actionText: '#FFFFFF',
      fontFamily: "'Architects Daughter', cursive",
      previewStripe: 'repeating-linear-gradient(90deg, #000 0px, #000 12px, #666 12px, #666 24px, #CCC 24px, #CCC 36px, #FFF 36px, #FFF 48px)',
    },
    {
      key: THEMES.BRAND,
      title: 'Brand Light',
      description: 'Canvas #F3F5FC · Text #14183A · Action #7048E0',
      canvasBg: '#F3F5FC',
      cardBg: '#FFFFFF',
      cardBorder: '1px solid #E2E6F5',
      textColor: '#14183A',
      actionColor: '#7048E0',
      actionText: '#FFFFFF',
      fontFamily: "'Figtree', sans-serif",
      previewStripe: 'linear-gradient(90deg, #7048E0 0%, #0070B8 50%, #28A8E0 100%)',
    },
    {
      key: THEMES.DARK,
      title: 'Dark',
      description: 'Canvas #0E1130 · Card #181C42 · Action #8B6CF0',
      canvasBg: '#0E1130',
      cardBg: '#181C42',
      cardBorder: '1px solid #4A52A0',
      textColor: '#ECEEFF',
      actionColor: '#8B6CF0',
      actionText: '#FFFFFF',
      fontFamily: "'Figtree', sans-serif",
      previewStripe: 'linear-gradient(90deg, #8B6CF0 0%, #3B82F6 50%, #06B6D4 100%)',
    },
    {
      key: THEMES.HIGH_CONTRAST,
      title: 'High Contrast',
      description: 'Canvas #000 · Border #FFF · Action #FFE600',
      canvasBg: '#000000',
      cardBg: '#000000',
      cardBorder: '2px solid #FFFFFF',
      textColor: '#FFFFFF',
      actionColor: '#FFE600',
      actionText: '#000000',
      fontFamily: "'Figtree', sans-serif",
      previewStripe: 'repeating-linear-gradient(-45deg, #FFE600 0px, #FFE600 10px, #000 10px, #000 20px)',
    },
  ];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
          Appearance
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
          Choose from 4 user-selectable themes. Applied instantly across the interface.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {themeOptions.map((opt) => (
          <ThemeCard
            key={opt.key}
            themeKey={opt.key}
            title={opt.title}
            description={opt.description}
            isActive={selectedTheme === opt.key}
            onSelect={handleSelectTheme}
            previewStripe={opt.previewStripe}
            canvasBg={opt.canvasBg}
            cardBg={opt.cardBg}
            cardBorder={opt.cardBorder}
            textColor={opt.textColor}
            actionColor={opt.actionColor}
            actionText={opt.actionText}
            fontFamily={opt.fontFamily}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Button variant="outline" onClick={handleReset} icon={RotateCcw}>
          Reset to Sketch
        </Button>
      </div>
    </div>
  );
}
