import { TESTER_GROUP_URL, TESTER_OPTIN_URL } from '../config';
import { Modal } from './Modal';

/** How to join the Android closed test: Play only admits people who are in the testers group. */
export function TesterModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Test the Android app" onClose={onClose}>
      <p>
        WordLock is coming to Google Play. Before it can launch, Google needs people to test it for two weeks.
        It's free, and your feedback shapes the app.
      </p>
      <ol className="tester-steps">
        <li>
          <a href={TESTER_GROUP_URL} target="_blank" rel="noopener noreferrer">
            Join the testers group
          </a>{' '}
          with your Google account.
        </li>
        <li>
          <a href={TESTER_OPTIN_URL} target="_blank" rel="noopener noreferrer">
            Opt in on Google Play
          </a>
          , then install WordLock.
        </li>
        <li>Keep it installed and play the daily puzzle for 14 days.</li>
      </ol>
    </Modal>
  );
}
