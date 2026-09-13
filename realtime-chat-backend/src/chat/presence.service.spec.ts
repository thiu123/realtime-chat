import { PresenceService } from './presence.service';

/**
 * PresenceService không phụ thuộc database nên test được trực tiếp,
 * không cần dựng TestingModule của NestJS.
 */
describe('PresenceService', () => {
  let presenceService: PresenceService;

  beforeEach(() => {
    presenceService = new PresenceService();
  });

  it('ghi nhận user là online sau khi thêm socket', () => {
    presenceService.addSocket('user-1', 'socket-a');

    expect(presenceService.getOnlineUserIds()).toEqual(['user-1']);
  });

  it('vẫn online khi đóng 1 trong 2 tab', () => {
    presenceService.addSocket('user-1', 'socket-a');
    presenceService.addSocket('user-1', 'socket-b');

    const result = presenceService.removeSocket('socket-a');

    expect(result).toEqual({ userId: 'user-1', isOnline: true });
    expect(presenceService.getOnlineUserIds()).toEqual(['user-1']);
  });

  it('offline khi đóng tab cuối cùng', () => {
    presenceService.addSocket('user-1', 'socket-a');

    const result = presenceService.removeSocket('socket-a');

    expect(result).toEqual({ userId: 'user-1', isOnline: false });
    expect(presenceService.getOnlineUserIds()).toEqual([]);
  });

  it('trả về null với socket chưa từng đăng ký user', () => {
    expect(presenceService.removeSocket('socket-la')).toBeNull();
  });
});
