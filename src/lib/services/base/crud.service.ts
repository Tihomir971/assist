export interface CRUDService<
	T,
	CreateT = Omit<T, 'id' | 'created_at' | 'updated_at'>,
	UpdateT = Partial<CreateT>
> {
	getById(id: number): Promise<T | null>;
	create(data: CreateT): Promise<T>;
	update(id: number, data: UpdateT): Promise<T>;
	delete(id: number): Promise<void>;
	list(filters?: Record<string, unknown>): Promise<T[]>;
}

export interface ServiceResult<T> {
	data?: T;
	error?: string;
	success: boolean;
}
