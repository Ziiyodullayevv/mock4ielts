'use client';

import { useMutation } from '@tanstack/react-query';

import {
  registerNotificationDevice,
  unregisterNotificationDevice,
} from '../api/notification-api';

export function useRegisterNotificationDeviceMutation() {
  return useMutation({
    mutationFn: registerNotificationDevice,
  });
}

export function useUnregisterNotificationDeviceMutation() {
  return useMutation({
    mutationFn: unregisterNotificationDevice,
  });
}
