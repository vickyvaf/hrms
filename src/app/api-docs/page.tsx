'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocs() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>API Documentation</h1>
      <SwaggerUI url="/api/docs" />
    </div>
  );
}
