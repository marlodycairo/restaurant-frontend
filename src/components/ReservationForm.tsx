import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import type { Reservation } from '../interfaces/reservation.interface';
import type { Table } from '../interfaces/table.interface';
import { ReservationFormSchema } from '../utils/validation';
import { ZodError } from 'zod';

interface ReservationFormProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: Reservation) => Promise<void>;
  isLoading?: boolean;
  initialData?: Reservation | null;
  tables: Table[];
}

interface FormErrors {
  [key: string]: string[];
}

export const ReservationForm = React.memo<ReservationFormProps>(
  ({ show, onClose, onSubmit, isLoading = false, initialData, tables }) => {
    const [formData, setFormData] = useState({
      id: initialData?.id || 0,
      customerName: initialData?.customerName || '',
      phone: initialData?.phone || '',
      startTime: initialData?.startTime?.split('T')[1]?.slice(0, 5) || '',
      endTime: initialData?.endTime?.split('T')[1]?.slice(0, 5) || '',
      tableId: initialData?.tableId || '',
      createdAt: initialData?.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
      if (!show) {
        setErrors({});
        setSubmitError(null);
      }
    }, [show]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      // Limpiar errores al escribir
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      setErrors({});

      const payload: Reservation = {
        id: initialData?.id || 0,
        customerName: formData.customerName,
        phone: formData.phone,
        startTime: `${formData.createdAt}T${formData.startTime}:00`,
        endTime: `${formData.createdAt}T${formData.endTime}:00`,
        tableId: Number(formData.tableId),
        createdAt: new Date().toISOString(),
      };

      try {
        // Validar con Zod
        ReservationFormSchema.parse(payload);
        
        // Validación adicional: la hora final debe ser después de la inicial
        const [startHour, startMin] = formData.startTime.split(':').map(Number);
        const [endHour, endMin] = formData.endTime.split(':').map(Number);
        const startDate = new Date(0, 0, 0, startHour, startMin);
        const endDate = new Date(0, 0, 0, endHour, endMin);

        if (endDate <= startDate) {
          setErrors({ endTime: ['La hora de fin debe ser posterior a la hora de inicio'] });
          return;
        }

        await onSubmit(payload);
        handleClose();
      } catch (error: unknown) {
        if (error instanceof ZodError) {
          const fieldErrors = error.flatten().fieldErrors;
          setErrors(fieldErrors as FormErrors);
        } else {
          setSubmitError('Error al procesar la solicitud');
        }
      }
    };

    const handleClose = () => {
      setFormData({
        id: 0,
        customerName: '',
        phone: '',
        startTime: '',
        endTime: '',
        tableId: '',
        createdAt: new Date().toISOString().split('T')[0],
      });
      setErrors({});
      setSubmitError(null);
      onClose();
    };

    return (
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{initialData ? 'Editar reserva' : 'Nueva reserva'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {submitError && <Alert variant="danger">{submitError}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Nombre del cliente</Form.Label>
              <Form.Control
                type="text"
                name="customerName"
                placeholder="Juan Pérez"
                value={formData.customerName}
                onChange={handleChange}
                isInvalid={!!errors.customerName}
                disabled={isLoading}
              />
              {errors.customerName && (
                <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                  {errors.customerName[0]}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Teléfono</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                placeholder="1234567890"
                value={formData.phone}
                onChange={handleChange}
                isInvalid={!!errors.phone}
                disabled={isLoading}
              />
              {errors.phone && (
                <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                  {errors.phone[0]}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Fecha</Form.Label>
              <Form.Control
                type="date"
                name="createdAt"
                value={formData.createdAt}
                onChange={handleChange}
                isInvalid={!!errors.createdAt}
                disabled={isLoading}
              />
              {errors.createdAt && (
                <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                  {errors.createdAt[0]}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Hora de inicio</Form.Label>
              <Form.Control
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                isInvalid={!!errors.startTime}
                disabled={isLoading}
              />
              {errors.startTime && (
                <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                  {errors.startTime[0]}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Hora de fin</Form.Label>
              <Form.Control
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                isInvalid={!!errors.endTime}
                disabled={isLoading}
              />
              {errors.endTime && (
                <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                  {errors.endTime[0]}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Mesa</Form.Label>
              <Form.Select
                name="tableId"
                value={formData.tableId}
                onChange={handleChange}
                isInvalid={!!errors.tableId}
                disabled={isLoading}
              >
                <option value="">Selecciona una mesa</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    Mesa {table.number} (Capacidad: {table.capacity})
                  </option>
                ))}
              </Form.Select>
              {errors.tableId && (
                <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                  {errors.tableId[0]}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
);

ReservationForm.displayName = 'ReservationForm';
