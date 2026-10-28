import React from 'react';
import {AbsoluteFill} from 'remotion';
import photoCredits from '../data/photo-credits.json';
import {Label, Rise} from '../fx';
import {hasPhoto} from '../illustrations';
import {pick, useLayout} from '../layout';
import {colors, font} from '../theme';
import {usesHumanVoice} from '../timeline';

export const Credits: React.FC = () => {
  const {vertical} = useLayout();
  const photos = Object.entries(photoCredits as Record<string, string>).filter(([id, credit]) => credit && hasPhoto(id));
  const rows = [
    'Քարտեզ՝ Natural Earth (հանրային սեփականություն)',
    'Երաժշտություն և ձայնային էֆեկտներ՝ ծրագրային սինթեզ',
    usesHumanVoice ? 'Ձայն՝ մարդկային ձայնագրություն' : 'Ձայն՝ eSpeak NG (սինթետիկ)',
    ...photos.map(([, credit]) => `Լուսանկար՝ ${credit}`),
    'Ստեղծված է Remotion-ով',
  ];
  return (
    <AbsoluteFill style={{background: colors.bg, alignItems: 'center', justifyContent: 'center', padding: pick(vertical, '0 70px 400px', '0 120px')}}>
      <Label size={pick(vertical, 36, 30)}>Աղբյուրներ</Label>
      <div style={{marginTop: 30}}>
        {rows.map((r, i) => (
          <Rise key={r} delay={8 + i * 6}>
            <div style={{fontFamily: font, fontWeight: 600, fontSize: pick(vertical, 32, 30), color: colors.muted, textAlign: 'center', marginTop: 14}}>{r}</div>
          </Rise>
        ))}
      </div>
    </AbsoluteFill>
  );
};
