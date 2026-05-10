import { Card } from 'react-bootstrap';

interface WidgetCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}

export default function WidgetCard({ title, value, icon, color }: WidgetCardProps) {
  return (
    <Card className="h-100">
      <Card.Body className="d-flex align-items-center">
        <div className={`bg-${color} bg-opacity-10 p-3 rounded-3 me-3 text-${color}`}>
          <i className={`bi ${icon} fs-3`}></i>
        </div>
        <div>
          <Card.Subtitle className="text-muted small mb-0 fw-semibold">{title}</Card.Subtitle>
          <Card.Title as="h4" className="fw-bold mb-0">{value}</Card.Title>
        </div>
      </Card.Body>
    </Card>
  );
}
