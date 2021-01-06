using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using controllers;
using models;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.VFX;
using UnityEngine.XR;
using Debug = UnityEngine.Debug;
using Object = UnityEngine.Object;
using Random = UnityEngine.Random;

public class GameController : MonoBehaviour
{
    private static GameObject _instance = null;

    // Controllers
    private NetworkController _networkController;
    private LooxidLinkController _looxidLinkController;
    private BlackLayerController _blackLayerController;
    private MusicController _musicController;
    
    public MeditationGroup Group { get; set; }
    public int OwnPlaceId;
    public bool ActiveMeditation = false;
    
    public float circleRadius = 2.5f;
    public int numberOfMeditationPlaces = 6;
    
    public GameObject humanSeizaPosturePrefab;
    public GameObject humanQuarterLotusPosturePrefab;
    public GameObject humanChairPosturePrefab;
    public GameObject orbPrefab;
    public GameObject activeMindPrefab;
    public GameObject meditationPlacePrefab;
    public GameObject chairPrefab;
    public LayerMask groundLayer;

    private GameObject _orbGameObject;
    private VisualEffect _orbVisualEffect;

    private Dictionary<int, GameObject> _meditationPlaceToParticipants;
    private Dictionary<int, GameObject> _meditationPlaceToEquipment;
    private Dictionary<int, GameObject> _meditationPlaceToActiveMind;
    private Dictionary<int, VisualEffect> _meditationPlaceToActiveMindEffect;
    private Dictionary<int, float> _meditationPlaceToOldRelaxation;
    private Dictionary<int, float> _meditationPlaceToNextRelaxation;
    private float _oldGroupRelaxation;
    private float _nextGroupRelaxation;

    private InputDevice _hmd;
    private GameObject _camera;
    private GameObject _cameraOffsetGameObject;
    private bool _userPresent = false;
    private bool _hmdOnOffDetectionEnabled = false;
    private bool _timeOver = false;

    private const float UpdateVisualEffectsEachXSeconds = 0.1f;

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
        _networkController = GameObject.Find("NetworkController").GetComponent<NetworkController>();
        _looxidLinkController = GameObject.Find("LooxidLinkController").GetComponent<LooxidLinkController>();
        _hmd = InputDevices.GetDeviceAtXRNode(XRNode.Head);
    }
    
    public void StartMeditation()
    {
        SceneManager.activeSceneChanged += LoadGroup;
        StartCoroutine(LoadMeditationSceneAsync());
    }

    private IEnumerator LoadMeditationSceneAsync()
    {
        AsyncOperation asyncLoad = SceneManager.LoadSceneAsync("Scenes/Space");
        while (!asyncLoad.isDone)
        {
            yield return null;
        }
    }

    private void LoadGroup(Scene currentScene, Scene nextScene)
    {
        // Unsubscribe
        SceneManager.activeSceneChanged -= LoadGroup;

        // Get XR Camera
        _cameraOffsetGameObject = GameObject.Find("Camera Offset");
        _camera = GameObject.Find("Main Camera");
        
        // Get scene related controllers
        _blackLayerController = _camera.transform.Find("BlackLayer").gameObject.GetComponent<BlackLayerController>();
        _musicController = GameObject.Find("Music").GetComponent<MusicController>();


        SpawnMeditationPlaces();
        
        // Add participants
        for (int placeId = 0; placeId < numberOfMeditationPlaces; placeId++)
        {
            Participant participant = Group.Participants.Find(item => item.PlaceId == placeId);
            if (participant != null)
            {
                AddParticipant(participant);
            }
        }
        
        _orbGameObject = Object.Instantiate(orbPrefab, new Vector3(0,1.5f, 0), Quaternion.identity);
        _orbVisualEffect = _orbGameObject.GetComponent<VisualEffect>();
        _oldGroupRelaxation = 0;
        _nextGroupRelaxation = 0;
        
        InvokeRepeating(nameof(EmitMentalState), 0f, 1f);
        InvokeRepeating(nameof(CheckHmd), 0f, 0.5f);
        _hmdOnOffDetectionEnabled = true;
        _blackLayerController.FadeOut(5f);
        _musicController.FadeIn(5f);
        ActiveMeditation = true;
        StartCoroutine(nameof(UpdateVisualEffects));
    }

    IEnumerator UpdateVisualEffects() {
        while (ActiveMeditation) {
            yield return new WaitForSeconds(UpdateVisualEffectsEachXSeconds);
            
            if (ActiveMeditation)
            {
                var currentGroupRelaxation = _orbVisualEffect.GetFloat("Calm");

                // Update group effect
                if ((_oldGroupRelaxation < _nextGroupRelaxation && currentGroupRelaxation < _nextGroupRelaxation) ||
                    (_oldGroupRelaxation > _nextGroupRelaxation && currentGroupRelaxation > _nextGroupRelaxation))
                {
                    _orbVisualEffect.SetFloat("Calm", currentGroupRelaxation + ((_nextGroupRelaxation -_oldGroupRelaxation) * UpdateVisualEffectsEachXSeconds));
                }

                // Participants
                foreach (var placeId in _meditationPlaceToActiveMindEffect.Keys)
                {
                    var currentRelaxation = _meditationPlaceToActiveMindEffect[placeId].GetFloat("Brightness");
                
                    if ((_meditationPlaceToOldRelaxation[placeId] < _meditationPlaceToNextRelaxation[placeId] && currentRelaxation < _meditationPlaceToNextRelaxation[placeId]) || 
                        (_meditationPlaceToOldRelaxation[placeId] > _meditationPlaceToNextRelaxation[placeId] && currentRelaxation > _meditationPlaceToNextRelaxation[placeId]))
                    {
                        _meditationPlaceToActiveMindEffect[placeId].SetFloat("Brightness", 
                            currentRelaxation + (( _meditationPlaceToNextRelaxation[placeId] -_meditationPlaceToOldRelaxation[placeId]) * UpdateVisualEffectsEachXSeconds));
                    }
                }
            }
        }
    }

    private void ResetView()
    {
        Vector3 meditationPlacePosition = PositionForMeditationPlace(OwnPlaceId);
        Vector3 currentCameraOffsetPosition = _cameraOffsetGameObject.transform.position;
        Vector3 currentCameraPosition = _camera.transform.position;
        Vector3 directionToOrb = (Vector2.zero - new Vector2(meditationPlacePosition.x, meditationPlacePosition.z)).normalized;
        const float offsetToAvatar = 0.1f; 
        
        float offsetX = currentCameraOffsetPosition.x - currentCameraPosition.x + meditationPlacePosition.x + directionToOrb.x * offsetToAvatar;
        float offsetZ = currentCameraOffsetPosition.z - currentCameraPosition.z + meditationPlacePosition.z + directionToOrb.z * offsetToAvatar;
        
        // Set camera 0.2 units before avatar
        _cameraOffsetGameObject.transform.position = new Vector3(offsetX, 0, offsetZ);

        // Face orb
        float angle = Vector2.SignedAngle(
            - new Vector2(_camera.transform.position.x, _camera.transform.position.z),
            new Vector2(_camera.transform.forward.x, _camera.transform.forward.z));

        _cameraOffsetGameObject.transform.RotateAround(_camera.transform.position, Vector3.up, angle);
    }

    public void OnGroupLeft()
    {
        ActiveMeditation = false;
        
        // Stop emitting mental state
        CancelInvoke(nameof(EmitMentalState));
        CancelInvoke(nameof(CheckHmd));
        
        _looxidLinkController.Terminate();
        
        // Remove group
        Group = null;
        
        // Disable HMD on/off detection
        _hmdOnOffDetectionEnabled = false;
    }
    
    private void AddParticipant(Participant participant)
    {
        if (_meditationPlaceToParticipants[participant.PlaceId] != null)
        {
            Debug.LogError("Meditation place is already taken.");
            return;
        }
        
        // Add to group model
        if (!Group.Participants.Contains(participant))
        {
            Group.Participants.Add(participant);
        }
        
        // Init Relaxation
        _meditationPlaceToOldRelaxation[participant.PlaceId] = 0;
        _meditationPlaceToNextRelaxation[participant.PlaceId] = 0;

        // Add to scene
        Vector3 position = PositionForMeditationPlace(participant.PlaceId);
        Quaternion rotation = RotationForMeditationPlace(participant.PlaceId);
        
        switch (participant.Posture)
        {
            case Posture.Seiza:
                _meditationPlaceToParticipants[participant.PlaceId] = Object.Instantiate(humanSeizaPosturePrefab, position + new Vector3(0,0.2f, 0), rotation);
                _meditationPlaceToActiveMind[participant.PlaceId] = Object.Instantiate(activeMindPrefab, position + new Vector3(0, 0.9f, 0), Quaternion.identity);
                break;
            
            case Posture.QuarterLotus:
                _meditationPlaceToParticipants[participant.PlaceId] = Object.Instantiate(humanQuarterLotusPosturePrefab, position + new Vector3(0,0.16f, 0), rotation);
                _meditationPlaceToActiveMind[participant.PlaceId] = Object.Instantiate(activeMindPrefab, position + new Vector3(0, 0.85f, 0), Quaternion.identity);
                break;
            
            case Posture.Chair:
                // Replace cushion by chair
                Object.Destroy(_meditationPlaceToEquipment[participant.PlaceId]);
                _meditationPlaceToEquipment[participant.PlaceId] = Object.Instantiate(chairPrefab, position, rotation * Quaternion.Euler(-90, 0, 0));

                _meditationPlaceToParticipants[participant.PlaceId] = Object.Instantiate(humanChairPosturePrefab, position + new Vector3(0, 0.44f, 0), rotation);
                _meditationPlaceToActiveMind[participant.PlaceId] = Object.Instantiate(activeMindPrefab, position + new Vector3(0, 1.14f, 0), Quaternion.identity);
                break;
        }
        _meditationPlaceToActiveMindEffect[participant.PlaceId] = _meditationPlaceToActiveMind[participant.PlaceId].GetComponent<VisualEffect>();
    }
    
    public void RemoveParticipant(int meditationPlaceId)
    {
        if (_meditationPlaceToParticipants[meditationPlaceId] != null)
        {
            // Remove human from scene
            Object.Destroy(_meditationPlaceToParticipants[meditationPlaceId]);
            _meditationPlaceToParticipants[meditationPlaceId] = null;
            
            // Remove active mind from scene
            Object.Destroy(_meditationPlaceToActiveMind[meditationPlaceId]);
            _meditationPlaceToActiveMind[meditationPlaceId] = null;
            _meditationPlaceToActiveMindEffect[meditationPlaceId] = null;
            
            // Replace chair by cushion
            if (Group.Participants[meditationPlaceId].Posture == Posture.Chair)
            {
                Object.Destroy(_meditationPlaceToEquipment[meditationPlaceId]);
                _meditationPlaceToEquipment[meditationPlaceId] = Object.Instantiate(meditationPlacePrefab,
                    PositionForMeditationPlace(meditationPlaceId), RotationForMeditationPlace(meditationPlaceId));
            }
            
            // Delete from group model
            Group.Participants = Group.Participants.Where(participant => participant.PlaceId != meditationPlaceId).ToList();
        }
    }

    public void UpdateMentalStates(MentalState groupMentalState, Dictionary<int, MentalState> participantsMentalStates)
    {
        if (ActiveMeditation)
        {
            // Group
            _oldGroupRelaxation = _orbVisualEffect.GetFloat("Calm");
            _nextGroupRelaxation = Math.Min(groupMentalState.Relaxation * 1.2f, 0.9f);
            
            // Participants
            foreach (var placeId in participantsMentalStates.Keys)
            {
                _meditationPlaceToOldRelaxation[placeId] = _meditationPlaceToActiveMindEffect[placeId].GetFloat("Brightness");
                _meditationPlaceToNextRelaxation[placeId] = participantsMentalStates[placeId].Active ? 
                    Math.Min(participantsMentalStates[placeId].Relaxation * 1.2f, 1f) : 0;
            }
        }
    }

    public void TimeOver()
    {
        OnGroupLeft();
        if (_userPresent)
        {
            _hmdOnOffDetectionEnabled = true;
            _timeOver = true;
            _blackLayerController.FadeIn(5, true);
            _musicController.FadeOut(5);
            
        }
        else
        {
            SceneManager.LoadScene("Scenes/Menu");
        }
    }

    private void EmitMentalState()
    {
        MentalState mentalState = _looxidLinkController.MentalState();
        mentalState.Active = _userPresent;
        _networkController.EmitMentalState(mentalState);
    }
    
    private void CheckHmd()
    {
        if (_hmdOnOffDetectionEnabled)
        {
            // If user puts on HMD reset view
            if (_hmd.TryGetFeatureValue(CommonUsages.userPresence, out bool userPresent))
            {
                if (!_userPresent && userPresent)
                {
                    OnPutOnHmd();
                }
                if (_userPresent && !userPresent)
                { 
                    OnPutOffHmd();
                }
                _userPresent = userPresent;
            }
        }
    }

    private void SpawnMeditationPlaces()
    {
        _meditationPlaceToParticipants = new Dictionary<int, GameObject>();
        _meditationPlaceToEquipment = new Dictionary<int, GameObject>();
        _meditationPlaceToActiveMind = new Dictionary<int, GameObject>();
        _meditationPlaceToActiveMindEffect = new Dictionary<int, VisualEffect>();
        _meditationPlaceToOldRelaxation = new Dictionary<int, float>();
        _meditationPlaceToNextRelaxation = new Dictionary<int, float>();


        for (var meditationPlaceId = 0; meditationPlaceId < numberOfMeditationPlaces; meditationPlaceId++)
        {
            // Add to scene
            _meditationPlaceToEquipment[meditationPlaceId] = Object.Instantiate(meditationPlacePrefab,
                PositionForMeditationPlace(meditationPlaceId), RotationForMeditationPlace(meditationPlaceId));
            
            // Add slot for participant
            _meditationPlaceToParticipants[meditationPlaceId] = null;
        }
    }

    private Vector3 PositionForMeditationPlace(int meditationPlaceId)
    {
        var positionX = circleRadius * Mathf.Cos(meditationPlaceId * (2 * Mathf.PI) / numberOfMeditationPlaces);
        var positionZ = circleRadius * Mathf.Sin(meditationPlaceId * (2 * Mathf.PI) / numberOfMeditationPlaces);
        var positionY = TerrainHeightAt(positionX, positionZ);
        return new Vector3(positionX, positionY, positionZ);
    }

    private Quaternion RotationForMeditationPlace(int meditationPlaceId)
    {
        return Quaternion.Euler(0, -90 - (meditationPlaceId * (360 / numberOfMeditationPlaces)), 0);
    }
    
    private static Posture RandomPostureType()
    {
        return (Posture) Random.Range(0, 2);
    }

    private float TerrainHeightAt(float posX, float posZ)
    {
        if (Physics.Raycast(new Vector3(posX, 9999f, posZ), Vector3.down, out var hit, Mathf.Infinity, groundLayer))
        {
            return hit.point.y;
        }

        return 0;
    }
    
    private void OnPutOnHmd()
    {
        ResetView();
    }

    private void OnPutOffHmd()
    {
        if (_timeOver)
        {
            _timeOver = false;
            _hmdOnOffDetectionEnabled = false;
            SceneManager.LoadScene("Scenes/Menu");
        }
    }
}