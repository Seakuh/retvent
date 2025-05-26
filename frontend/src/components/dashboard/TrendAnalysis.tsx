import React from 'react';
import { TrendingUp } from 'lucide-react';
import Card from '../ui/Card';
import { Trend } from '../../types';
import Button from '../ui/Button';

interface TrendAnalysisProps {
  trends: Trend[];
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ trends }) => {
  return (
    <Card 
      title="Trend Analysis" 
      icon={TrendingUp}
      footer={
        <Button variant="ghost" size="sm" style={{ width: '100%' }}>
          Add Custom Trend
        </Button>
      }
    >
      <div>
        {trends.map((trend) => (
          <div 
            key={trend.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--space-2) 0',
              borderBottom: '1px solid var(--color-neutral-100)'
            }}
          >
            <div>
              <div style={{ fontWeight: '500' }}>{trend.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                {trend.category}
              </div>
            </div>
            <div 
              style={{ 
                backgroundColor: trend.relevance > 80 
                  ? 'var(--color-success-50)'
                  : trend.relevance > 60
                    ? 'var(--color-secondary-50)'
                    : 'var(--color-neutral-100)',
                color: trend.relevance > 80 
                  ? 'var(--color-success-600)'
                  : trend.relevance > 60
                    ? 'var(--color-secondary-600)'
                    : 'var(--color-neutral-600)',
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}
            >
              {trend.relevance}%
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TrendAnalysis;