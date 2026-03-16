import { SafeAreaView, Text, View } from 'react-native';

import { Button, Card } from '@emedex/ui-native';

export default function App() {
  return (
    <SafeAreaView>
      <View style={{ padding: 24, gap: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: '600' }}>Field Intake</Text>
        <Card title="Offline-first intake" description="Encrypted local case, media, and audit storage scaffold." />
        <Button label="Enroll device" onPress={() => undefined} />
      </View>
    </SafeAreaView>
  );
}