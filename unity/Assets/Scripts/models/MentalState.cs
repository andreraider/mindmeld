using System.Collections.Generic;

namespace models
{
    public class MentalState
    {
        public bool Active;
        public readonly float Relaxation;

        public MentalState(float relaxation, bool active = false)
        {
            Active = active;
            Relaxation = relaxation;
        }
    }
}