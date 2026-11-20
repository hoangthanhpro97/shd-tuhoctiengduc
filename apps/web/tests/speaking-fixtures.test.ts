import { describe, expect, it } from 'vitest';
import { SpeakingTaskSchema } from '@shd/contracts';
import { speakingTasks } from '../data/speaking-fixtures';

describe('Speaking Hub fixtures', () => {
  it('contains three B1 tasks for each supported provider', () => {
    expect(speakingTasks).toHaveLength(9);
    expect(speakingTasks.filter((task) => task.examProvider === 'goethe_b1')).toHaveLength(3);
    expect(speakingTasks.filter((task) => task.examProvider === 'osd_zb1')).toHaveLength(3);
    expect(speakingTasks.filter((task) => task.examProvider === 'osd_zdo_b1')).toHaveLength(3);
  });

  it('validates every prototype conversion against the public contract', () => {
    speakingTasks.forEach((task) => expect(SpeakingTaskSchema.safeParse(task).success).toBe(true));
    const presentation = speakingTasks.find((task) => task.taskType === 'PRESENTATION_SLIDES');
    expect(presentation?.slides).toHaveLength(5);
    expect(presentation?.slides?.[3].contentDe).toContain('Einerseits');
  });
});
