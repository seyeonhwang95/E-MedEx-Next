import { Pressable, Text, View } from 'react-native';

export function Button({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{ backgroundColor: '#0f766e', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 }}
    >
      <Text style={{ color: '#f8fafc', fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function Card({ title, description }: { title: string; description: string }) {
  return (
    <View style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 16, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>{title}</Text>
      <Text style={{ color: '#475569' }}>{description}</Text>
    </View>
  );
}