'use server';

import { getCurrentUser } from '@/features/auth/actions';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { Templates } from '@prisma/client';
import { getTemplateFiles } from '@/lib/templates';

export const createPlayground = async (data: {
  title: string;
  template: Templates;
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
        description: description || '',
        userId: user!.id,
        templateFile: {
          create: {
            content: getTemplateFiles(template),
          },
        },
      },
    });

    return playground;
  } catch (error) {
    logger.error(error, 'Error creating playground');
    return null;
  }
};
export const createPlaygroundFromGithub = async (data: {
  title: string;
  description?: string;
  userId: string;
  files: Record<string, any>;
}) => {
  const { title, description, files } = data;
  const user = await getCurrentUser();

  try {
    const playground = await db.playground.create({
      data: {
        title,
        template: 'REACT',
        description: description || `Imported from GitHub`,
        userId: user!.id,
        templateFile: {
          create: {
            content: files,
          },
        },
      },
    });

    return playground;
  } catch (error) {
    logger.error(error, 'Error creating playground from GitHub import');
    return null;
  }
};

export const getAllPlaygroundForUser  = async() => {
  const user = await getCurrentUser();
  try {
    const playgrounds = await db.playground.findMany({
      where:{
        userId: user!.id
      },
      include:{
        user: true,
        Starmark:{
          where:{
            userId: user?.id
          },
          select:{
            isMarked: true
          }
        }
      },
    });
    return playgrounds;
  } catch(error){
    logger.error(error, 'Error fetching playgrounds for user');
    return null;
  }
}

