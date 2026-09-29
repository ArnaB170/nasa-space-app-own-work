/**
 * /post-fire-clearance — Page Route
 *
 * Thin wrapper that mounts the PostFireClearanceDashboard component.
 * Adding or removing this file has zero impact on any other route.
 */

import PostFireClearanceDashboard from "@/components/post-fire/PostFireClearanceDashboard";

export const metadata = {
  title: "Post-Fire Clearance | NASA Space Apps",
  description:
    "Real-time post-fire compartment clearance assessment using NASA 1-Hour SMAC limits.",
};

export default function PostFireClearancePage() {
  return <PostFireClearanceDashboard />;
}
