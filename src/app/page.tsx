import { LandingPage } from '@/components/landing-page';
import {
  StructuredData,
  getAppStructuredData,
} from '@/components/structured-data';

export default function HomePage() {
  return (
    <>
      <StructuredData data={getAppStructuredData()} />
      <LandingPage />
    </>
  );
}
