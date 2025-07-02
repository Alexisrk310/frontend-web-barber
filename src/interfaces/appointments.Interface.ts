export interface Agenda {
	id: number;
	dateTime: string;
	status: string;
	gender: string;
	service: string;
	createdAt: string;
	updatedAt: string;
	name: string;
}
export interface AgendaCardProps {
	agenda: Agenda;
	onEdit: (agenda: Agenda) => void;
	onDelete: (id: number) => void;
}
