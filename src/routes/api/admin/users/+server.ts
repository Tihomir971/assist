// src/routes/api/admin/users/+server.ts
import { json, error, type RequestHandler } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase-admin.js';
import type {
	CreateUserRequest,
	CreateUserResponse,
	ListUsersResponse
} from '$lib/types/supabase.admin.js';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Verify user is authenticated
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// Check if user is admin
	const { data: profile, error: profileError } = await supabaseAdmin
		.from('profiles')
		.select('role, is_admin')
		.eq('id', locals.user.id)
		.single();

	if (profileError || (!profile?.is_admin && profile?.role !== 'admin')) {
		throw error(403, 'Admin access required');
	}

	const body: CreateUserRequest = await request.json();
	const { email, password, userData = {} } = body;

	if (!email || !password) {
		throw error(400, 'Email and password are required');
	}

	try {
		// Create user with admin API
		const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
			email,
			password,
			email_confirm: true,
			user_metadata: userData
		});

		if (createError) {
			throw error(400, createError.message);
		}

		if (!newUser.user) {
			throw error(500, 'Failed to create user');
		}

		// Create profile record
		const { error: profileError } = await supabaseAdmin.from('profiles').insert({
			id: newUser.user.id,
			email: newUser.user.email,
			name: userData.name || null,
			role: userData.role || 'user',
			is_admin: userData.role === 'admin'
		});

		if (profileError) {
			throw error(400, profileError.message);
		}

		// Log admin action
		await supabaseAdmin.from('admin_audit_log').insert({
			admin_id: locals.user.id,
			action: 'create_user',
			target_email: email,
			timestamp: new Date().toISOString()
		});

		const response: CreateUserResponse = { user: newUser.user };
		return json(response);
	} catch (err) {
		console.error('Error creating user:', err);
		throw error(500, 'Internal server error');
	}
};

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// Check admin status
	const { data: profile, error: profileError } = await supabaseAdmin
		.from('profiles')
		.select('role, is_admin')
		.eq('id', locals.user.id)
		.single();

	if (profileError || (!profile?.is_admin && profile?.role !== 'admin')) {
		throw error(403, 'Admin access required');
	}

	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100); // Cap at 100

	try {
		// Get users with admin API
		const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
			page,
			perPage: limit
		});

		if (usersError) {
			throw error(400, usersError.message);
		}

		const response: ListUsersResponse = {
			users: usersData.users,
			total: usersData.total || 0
		};

		return json(response);
	} catch (err) {
		console.error('Error fetching users:', err);
		throw error(500, 'Internal server error');
	}
};
