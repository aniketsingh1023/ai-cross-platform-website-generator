'use server';

import { getCurrentUser } from '@/features/auth/actions';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import type { TemplateType } from '@/features/auth/playground/constants';

export const createPlayground = async (data: {
  title: string;
  template: TemplateType;
  description?: string;
  userId: string;
}) => {
  const { template, title, description } = data;
  const user = await getCurrentUser();

  try {
    const playground = await db.playground.create({
      data: {
        title,
        template, 
        description,
        userId: user!.id,
      },
    });

    return playground;
  } catch (error) {
    logger.error(error, 'Error creating playground');
    throw error;
  }
};
