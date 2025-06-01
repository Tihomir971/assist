import * as avatar from '@zag-js/avatar';

export interface AvatarProps extends Omit<avatar.Props, 'id'> {
	/**
	 * The src of the avatar image
	 */
	src?: string;
	/**
	 * The srcSet of the avatar image
	 */
	srcSet?: string;
	/**
	 * The name of the avatar
	 */
	name: string;
}
