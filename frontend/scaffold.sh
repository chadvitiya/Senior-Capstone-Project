#!/bin/bash
set -e
cd "$(dirname "$0")/src"
rm -f App.css
rm -rf assets
mkdir -p pages components/layout components/common components/dashboard components/detail components/investigation components/chat state api types mocks

make_component() {
  cat > "$1/$2.tsx" <<EOF
export default function $2() {
  return (
    <div className="border border-dashed border-stone-400 rounded p-3 text-sm text-stone-500">
      $2
    </div>
  )
}
EOF
  echo "created $1/$2.tsx"
}

for c in DashboardPage InvestigationPage; do make_component pages $c; done
for c in NavBar AppShell; do make_component components/layout $c; done
for c in SeverityBadge HostLabel; do make_component components/common $c; done
for c in FilterBar StatCards Sparkline AnomalyTable GroupBySelect Pagination; do make_component components/dashboard $c; done
for c in EventDetailModal HandshakeCompare FlagReasons; do make_component components/detail $c; done
for c in InvestigationHeader OverviewStrip TimeWindowControls TimelineLegend HostTimeline HostRow StepTrail EmptyInvestigation; do make_component components/investigation $c; done
for c in AIDrawer ScopeNote ChatMessage SuggestionCard ChatInput; do make_component components/chat $c; done