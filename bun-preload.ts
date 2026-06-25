import v8 from 'node:v8';

if (v8?.startupSnapshot) {
  try {
    v8.startupSnapshot.isBuildingSnapshot();
  } catch {
    Object.defineProperty(v8.startupSnapshot, 'isBuildingSnapshot', {
      value: () => false,
      writable: true,
      configurable: true,
    });
  }
}
