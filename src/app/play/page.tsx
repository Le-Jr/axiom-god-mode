import type { Metadata } from 'next';
import { PlayClient } from './PlayClient';

export const metadata: Metadata = {
  title: 'AXIOM: Play',
};

export default function PlayPage() {
  return <PlayClient />;
}
