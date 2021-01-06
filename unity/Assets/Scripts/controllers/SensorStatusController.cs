using System.Collections;
using Looxid.Link;
using UnityEngine;
using UnityEngine.UI;

namespace controllers
{
    public class SensorStatusController : MonoBehaviour
    {
        public float CheckStatusEveryXSeconds = 0.5f;
        public Image[] SensorStatusImage;
        public Color ConnectedColor = Color.white;
        public Color DisconnectedColor = Color.white;
        private LooxidLinkController _looxidLinkController;
        private GameController _gameController;
        private float _counter = 0;
        private bool _startedMeditation = false;

        void Start()
        {
            _looxidLinkController = GameObject.Find("LooxidLinkController").GetComponent<LooxidLinkController>();
            _gameController = GameObject.Find("GameController").GetComponent<GameController>();
            _looxidLinkController.Initialize();
            StartCoroutine(CheckSensorStatus());
        }

        IEnumerator CheckSensorStatus()
        {
            while (this.gameObject.activeSelf)
            {
                yield return new WaitForSeconds(CheckStatusEveryXSeconds);

                EEGSensor sensorStatusData = _looxidLinkController.SensorStatusData();

                if (sensorStatusData != null)
                {
                    int numChannel = System.Enum.GetValues(typeof(EEGSensorID)).Length;
                    bool allSensorsOn = true;
                    for (int i = 0; i < numChannel; i++)
                    {
                        bool isSensorOn = sensorStatusData.IsSensorOn((EEGSensorID)i);
                        SensorStatusImage[i].color = isSensorOn ? ConnectedColor : DisconnectedColor;
                        
                        if (!isSensorOn)
                        {
                            allSensorsOn = false;
                        }
                    }

                    // Wait for two seconds until change scene
                    _counter = allSensorsOn ? _counter + CheckStatusEveryXSeconds : 0;

                    if (_counter > 2f)
                    {
                        if (!_startedMeditation)
                        {
                            _startedMeditation = true;
                            _gameController.StartMeditation();   
                        }
                    }
                }
            }
        }
    }
}
