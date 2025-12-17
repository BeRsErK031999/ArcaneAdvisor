import React from 'react';
import { useRouter } from 'expo-router';

import { ToolForm } from '@/features/tools/components/ToolForm';

export default function ToolCreateScreen() {
  const router = useRouter();

  return (
    <ToolForm
      mode="create"
      onSuccess={(id) =>
        router.replace({
          pathname: '/(tabs)/library/equipment/tools/[toolId]',
          params: { toolId: id },
        })
      }
    />
  );
}
