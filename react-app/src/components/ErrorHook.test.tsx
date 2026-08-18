import { act, renderHook } from '@testing-library/react';
import { MAX_ERRORS, useErrorHook } from './ErrorHook';

describe('useErrorHook', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with the initial state', () => {
    const { result } = renderHook(() => useErrorHook([]));

    expect(result.current.errors).toEqual([]);
  });

  it('pushes an error with a generated id', () => {
    const { result } = renderHook(() => useErrorHook([]));

    act(() => result.current.pushError('No character name'));

    expect(result.current.errors).toHaveLength(1);
    expect(result.current.errors[0]).toMatchObject({
      message: 'No character name',
      disabled: false,
      isSuccess: false
    });
    expect(result.current.errors[0].id).toEqual(expect.any(String));
  });

  it('gives each error a unique id', () => {
    const { result } = renderHook(() => useErrorHook([]));

    act(() => result.current.pushError('first'));
    act(() => result.current.pushError('second'));

    const [first, second] = result.current.errors;
    expect(first.id).not.toEqual(second.id);
  });

  it('can push a success message', () => {
    const { result } = renderHook(() => useErrorHook([]));

    act(() => result.current.pushError('Character saved', true));

    expect(result.current.errors[0].isSuccess).toBe(true);
  });

  it('stops adding errors once MAX_ERRORS is reached', () => {
    const { result } = renderHook(() => useErrorHook([]));

    for (let i = 0; i < MAX_ERRORS + 5; i++) {
      act(() => result.current.pushError(`error ${i}`));
    }

    expect(result.current.errors).toHaveLength(MAX_ERRORS);
  });

  it('disables the cancelled error and leaves the others alone', () => {
    const { result } = renderHook(() => useErrorHook([
      { id: 'a', message: 'first', disabled: false, isSuccess: false },
      { id: 'b', message: 'second', disabled: false, isSuccess: false }
    ]));

    act(() => result.current.cancelError('b'));

    expect(result.current.errors[0].disabled).toBe(false);
    expect(result.current.errors[1].disabled).toBe(true);
  });
});
