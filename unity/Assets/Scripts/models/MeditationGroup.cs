using System.Collections.Generic;

namespace models
{
    public class MeditationGroup
    {
        public readonly string Name;
        public List<Participant> Participants;
        public readonly bool Started;
        public readonly int Duration;

        public MeditationGroup(string name, bool started, int duration, List<Participant> participants = null)
        {
            Name = name;
            Participants = participants;
            Started = started;
            Duration = duration;
        }
    }
}