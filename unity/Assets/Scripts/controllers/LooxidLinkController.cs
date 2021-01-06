using System.Collections.Generic;
using System.Linq;
using Looxid.Link;
using models;
using UnityEngine;

public class LooxidLinkController : MonoBehaviour
{
    private static GameObject _instance = null;

    private EEGSensor _sensorStatusData;
    private LinkDataValue _relaxation;
    private List<float> _relaxationBuffer;
    private const int LinkFrequency = 5;

    private void Awake()
    {
        // Make object singleton
        if (_instance is null)
        {
            _instance = gameObject;
        }
        else
        {
            Destroy(gameObject);
        }
        
        // Keep object when switching to another scene
        DontDestroyOnLoad(gameObject);
    }
    
    void Start()
    {
        // Init members
        _relaxation = new LinkDataValue();
        _relaxationBuffer = new List<float>();

        // Add delegate functions
        LooxidLinkManager.OnLinkCoreConnected += OnLinkCoreConnected;
        LooxidLinkManager.OnLinkCoreDisconnected += OnLinkCoreDisconnected;
        LooxidLinkManager.OnLinkHubConnected += OnLinkHubConnected;
        LooxidLinkManager.OnLinkHubDisconnected += OnLinkHubDisconnected;
        LooxidLinkManager.OnShowSensorOffMessage += OnShowSensorOffMessage;
        LooxidLinkManager.OnHideSensorOffMessage += OnHideSensorOffMessage;
        LooxidLinkManager.OnShowNoiseSignalMessage += OnShowNoiseSignalMessage;
        LooxidLinkManager.OnHideNoiseSignalMessage += OnHideNoiseSignalMessage;

        // Disable default messages
        LooxidLinkManager.Instance.SetDisplayDisconnectedMessage(false);
        LooxidLinkManager.Instance.SetDisplaySensorOffMessage(false);
        LooxidLinkManager.Instance.SetDisplayNoiseSignalMessage(false);
        
        LooxidLinkData.OnReceiveMindIndexes += OnReceiveMindIndexes;
        LooxidLinkData.OnReceiveEEGSensorStatus += OnReceiveEEGSensorStatus;
    }

    void Update()
    {
        if (!LooxidLinkManager.Instance.isLinkCoreConnected) return;
        if (!LooxidLinkManager.Instance.isLinkHubConnected) return;
    }

    public void Initialize()
    {
        LooxidLinkManager.Instance.Initialize();
    }

    public void Terminate()
    {
        LooxidLinkManager.Instance.Terminate();
    }

    public MentalState MentalState()
    {
        return new MentalState(Relaxation());
    }
    
    public EEGSensor SensorStatusData()
    {
        return _sensorStatusData;
    }

    private float Relaxation()
    {
        float relaxation = _relaxationBuffer.DefaultIfEmpty(0).Average();
        _relaxationBuffer.Clear();
        return relaxation;
    }

    private void OnReceiveMindIndexes(MindIndex mindIndexData)
    {
        _relaxation.value = double.IsNaN(mindIndexData.relaxation)
            ? 0.0f
            : (float) LooxidLinkUtility.Scale(LooxidLink.MIND_INDEX_SCALE_MIN, LooxidLink.MIND_INDEX_SCALE_MAX, 
                0.0f, 1.0f, mindIndexData.relaxation);

        _relaxationBuffer.Add((float) _relaxation.value);
    }
    
    private void OnReceiveEEGSensorStatus(EEGSensor sensorStatusData)
    {
        _sensorStatusData = sensorStatusData;
    }

    private void OnLinkCoreConnected()
    {
        Debug.Log("Link Core is connected.");
    }
    
    private void OnLinkCoreDisconnected()
    {
        Debug.Log("Link Core is disconnected.");
    }
    
    private void OnLinkHubConnected()
    {
        Debug.Log("Link Hub is connected.");
    }
    
    private void OnLinkHubDisconnected()
    {
        Debug.Log("Link Hub is disconnected.");
    }

    private void OnShowSensorOffMessage()
    {
        Debug.Log("Sensor disconnected.");
    }
    
    private void OnHideSensorOffMessage()
    {
        Debug.Log("Sensor reconnected.");
    }
    
    private void OnShowNoiseSignalMessage()
    {
        Debug.Log("Too much noise detected.");
    }
    
    private void OnHideNoiseSignalMessage()
    {
        Debug.Log("Noise level reduced.");
    }
}
